
  const Slider = ({ perPage, data, content }: TBankPartnerSliderProps) => {
    const groups = useMemo(() => {
        // Создаем массив групп
        const result: ListItem[][] = Array.from({ length: perPage }, () => []);
        
        // Распределяем элементы по группам с шагом perPage
        data.forEach((item, index) => {
            const groupIndex = index % perPage;
            result[groupIndex].push(item);
        });
        
        return result.filter(group => group.length > 0);
    }, [data, perPage]);

    return (
        <div className={cx(CLASS_NAME)}>
            <Splide options={sliderOptions} className={cx(`${CLASS_NAME}_splide`)}>
                {groups.map((group, groupIndex) => (
                    <SplideSlide key={groupIndex}>
                        {/* Рендерим содержимое группы */}
                        {group.map((item, itemIndex) => (
                            <Card key={itemIndex} content={content} item={item} />
                        ))}
                    </SplideSlide>
                ))}
            </Splide>
        </div>
    );
};