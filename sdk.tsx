import React, { useState } from 'react';
import ReactSlider, { ReactSliderProps } from 'react-slider';
import './Slider.scss';

interface SliderProps extends Omit<ReactSliderProps, 'onChange'> {
  /**
   * Callback при изменении значения
   */
  onChange?: (value: number | number[]) => void;
  /**
   * Дополнительный класс для корневого элемента
   */
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  className = '',
  onChange,
  min = 0,
  max = 100,
  ...props
}) => {
  const [value, setValue] = useState<number | number[]>(
    props.defaultValue || (Array.isArray(props.value) ? [min, max] : min
  );

  const handleChange = (newValue: number | number[]) => {
    setValue(newValue);
    onChange?.(newValue);
  };

  return (
    <div className={`slider ${className}`.trim()}>
      <ReactSlider
        {...props}
        min={min}
        max={max}
        value={value}
        onChange={handleChange}
        className="slider__container"
        thumbClassName="slider__thumb"
        thumbActiveClassName="slider__thumb--active"
        trackClassName="slider__track"
        markClassName="slider__mark"
        renderThumb={(thumbProps, state) => (
          <div {...thumbProps} className="slider__thumb">
            <span className="slider__thumb-value">
              {Array.isArray(value) ? value[state.index] : value}
            </span>
          </div>
        )}
      />
    </div>
  );
};