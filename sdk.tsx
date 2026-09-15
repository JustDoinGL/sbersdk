import {
  dictionariesApi,
  PRODUCT,
  ProductCodeMap,
  Dictionary,
} from "@products/domain/shared/5_api";
import {
  MultiSelectProps,
  type Option,
  useToast,
  Loader,
  Alert,
  Show,
} from "@sg/uikit";
import { useRef, useState } from "react";
import { Control, FieldValues, Path } from "react-hook-form";
import { useInfiniteQuery } from "@tanstack/react-query";

import { ControlledInputField, SearchResultCard } from "@/5_shared/ui";

type DictionaryOption = Dictionary & {
  description?: string;
};

type Props<
  FormData extends FieldValues,
  T extends PRODUCT,
  K extends ProductCodeMap[T],
> = {
  control: Control<FormData>;
  name: Path<FormData>;
  wrapperClassName?: string;
  product: T;
  code: K;
} & Omit<MultiSelectProps<string>, "ref" | "options">;

const PAGE_SIZE = 20;
const LOAD_MORE_INDEX = 9;
const DEBOUNCE_DELAY = 500;

const useInfinityScroll = ({
  scrollContainerRef,
  targetRef,
  onLoadMore,
  hasNextPage,
  isFetchingNextPage,
}: {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  targetRef: React.RefObject<HTMLDivElement | null>;
  onLoadMore: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}) => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setTargetRef = (node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (!node || !scrollContainerRef.current) {
      return;
    }

    targetRef.current = node;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage
        ) {
          onLoadMore();
        }
      },
      {
        root: scrollContainerRef.current,
        threshold: 0,
      },
    );

    observerRef.current.observe(node);
  };

  return {
    setTargetRef,
  };
};

export const DictionarySearchSelect = <
  FormData extends FieldValues,
  T extends PRODUCT,
  K extends ProductCodeMap[T],
>({
  product,
  code,
  ...rest
}: Props<FormData, T, K>) => {
  const { push } = useToast();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const [query, setQuery] = useState("");

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["dictionary", product, code, query],

    initialPageParam: 1,

    queryFn: async ({ pageParam, signal }) => {
      const response = await dictionariesApi.searchDictionary(
        product,
        {
          code,
          query,
          page: pageParam,
          page_size: PAGE_SIZE,
        },
        signal,
      );

      return response;
    },

    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce(
        (total, page) => total + page.data.length,
        0,
      );

      if (loadedCount >= lastPage.count) {
        return undefined;
      }

      return allPages.length + 1;
    },

    enabled: Boolean(product && code),
    staleTime: 0,
  });

  const options = data?.pages.flatMap((page) => page.data) ?? [];

  const handleSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.currentTarget.value;

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setQuery(value);
    }, DEBOUNCE_DELAY);

    rest.onChange?.(e);
  };

  const { setTargetRef } = useInfinityScroll({
    scrollContainerRef,
    targetRef: loadMoreRef,
    hasNextPage: Boolean(hasNextPage),
    isFetchingNextPage,
    onLoadMore: () => {
      fetchNextPage();
    },
  });

  return (
    <div className={rest.wrapperClassName}>
      <ControlledInputField
        {...rest}
        onChange={handleSearchChange}
      />

      <div
        ref={scrollContainerRef}
        style={{
          overflowY: "auto",
          maxHeight: 400,
        }}
      >
        <Show
          when={!isLoading}
          fallback={<Loader />}
        >
          <Show
            when={options.length !== 0 || isError}
            fallback={
              <Alert
                type="error"
                title="Ничего не найдено"
                description="Попробуйте уточнить запрос или ввести другое значение"
                fluid
              />
            }
          >
            {options.map((option, index) => {
              const isLoadMoreTarget =
                index === LOAD_MORE_INDEX;

              return (
                <div
                  key={option.value}
                  ref={isLoadMoreTarget ? setTargetRef : undefined}
                >
                  <SearchResultCard
                    title={option.label}
                    details={
                      "description" in option
                        ? option.description
                        : undefined
                    }
                    actionLabel="Выбрать"
                    onClick={() => {
                      // здесь оставляем твою текущую логику onSelect
                    }}
                  />
                </div>
              );
            })}

            {isFetchingNextPage && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "16px 0",
                }}
              >
                <Loader />
              </div>
            )}
          </Show>
        </Show>
      </div>
    </div>
  );
};