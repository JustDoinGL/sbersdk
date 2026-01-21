const InfinityComponent = ({ 
    Loader, 
    NotFound, 
    Card, 
    GlobalLoader,
    renderItem // Опциональный рендер-проп
}) => {
    if (isLoading && flatActivitiesData.length === 0) {
        return <GlobalLoader />;
    }

    if (!isLoading && flatActivitiesData.length === 0) {
        return <NotFound />;
    }

    const setItemRef = useCallback((el, virtualItem, isObserverItem) => {
        if (el) {
            virtualizer.measureElement(el);
            if (isObserverItem && !isFetchingNextPage) {
                cursorRef.current = el;
            }
        }
    }, [virtualizer, isFetchingNextPage]);

    return (
        <div
            ref={scrollContainerRef}
            style={{ 
                height: virtualizer.getTotalSize(), 
                position: "relative",
                overflow: "auto"
            }}
        >
            {virtualizer.getVirtualItems().map((virtualItem) => {
                const index = virtualItem.index;
                const isLoaded = index < flatActivitiesData.length;
                const activity = flatActivitiesData[index];
                const itemsFromEnd = flatActivitiesData.length - index;
                const isObserverItem = itemsFromEnd <= ACTIVITIES_CONFIG.PAGE_SIZE;

                // Используем кастомный рендер или дефолтный
                if (renderItem) {
                    return renderItem({
                        virtualItem,
                        isLoaded,
                        activity,
                        isObserverItem,
                        setItemRef: (el) => setItemRef(el, virtualItem, isObserverItem)
                    });
                }

                // Дефолтный рендер
                return (
                    <div
                        key={virtualItem.key || index}
                        data-index={index}
                        ref={(el) => setItemRef(el, virtualItem, isObserverItem)}
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            transform: `translateY(${virtualItem.start}px)`,
                            willChange: "transform"
                        }}
                    >
                        {isLoaded ? (
                            activity ? (
                                <Card 
                                    key={activity.id || `card-${index}`}
                                    activity={activity}
                                />
                            ) : (
                                <div>Элемент {index} недоступен</div>
                            )
                        ) : (
                            <Loader />
                        )}
                    </div>
                );
            })}
            
            {isFetchingNextPage && (
                <div style={{ padding: "20px", textAlign: "center" }}>
                    <Loader />
                </div>
            )}
        </div>
    );
};

// Использование с кастомным рендером:
<InfinityComponent
    Loader={MyLoader}
    NotFound={MyNotFound}
    Card={ActivityCard}
    GlobalLoader={GlobalSpinner}
    renderItem={({ virtualItem, isLoaded, activity, setItemRef }) => (
        <div
            ref={setItemRef}
            style={{ transform: `translateY(${virtualItem.start}px)` }}
        >
            {isLoaded ? (
                <CustomCard activity={activity} />
            ) : (
                <SkeletonLoader />
            )}
        </div>
    )}
/>