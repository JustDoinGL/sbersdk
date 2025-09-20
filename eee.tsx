import { useQuery } from "@tanstack/react-query";
import { todoListApi } from "./api";

export function useTodoList() {
  const { data: todoItems, error, isLoading,refetch , isError} = useQuery({
    ...todoListApi.getTodoListQueryOptions(),
    select: data => data.toReversed(),    
  });

  return { error, todoItems, isLoading, refetch };
}
