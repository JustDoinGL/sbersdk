import { useEffect, useRef } from 'react';
import cx from 'classnames';

interface TopOffersProps {
  id?: string;
  title: string;
  items?: any[]; // Уточните тип для items
  className?: string;
}

const useHorizontalScroll = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const transformScroll = (event: WheelEvent) => {
      if (!event.deltaY) return;

      element.scrollLeft += event.deltaY + event.deltaX;
      event.preventDefault();
    };

    element.addEventListener('wheel', transformScroll);

    return () => {
      element.removeEventListener('wheel', transformScroll);
    };
  }, []);

  return ref;
};

const TopOffers = ({ id = 'TopOffers', title, items, className }: TopOffersProps) => {
  const ref = useHorizontalScroll();

  return (
    <div className={cx('TopOffers', className)} id={id}>
      <div className={cx('TopOffers_inner')}>
        <h3 className={cx('TopOffers_title')}>{title}</h3>

        <div
          ref={ref}
          style={{
            overflowX: 'auto',
            width: '90vw',
            display: 'flex',
            gap: '10px',
            whiteSpace: 'nowrap',
            scrollBehavior: 'smooth',
          }}
        >
          {Array.from({ length: 10 }).map((_, idx) => (
            <div 
              key={idx} 
              style={{ 
                minWidth: '300px', 
                height: '400px',
                backgroundColor: '#eee',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}
            >
              {idx + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopOffers;