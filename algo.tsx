import { useStateContext } from "@products/bridge";
import { Step, Steps } from "@sg/uikit";
import { FC, useEffect, useRef } from "react";

import styles from "./stepper.module.css";

export const Stepper: FC = () => {
  const { currentStep } = useStateContext();
  const { steps } = useStateContext();
  const completedSteps = new Set(Array.from({ length: currentStep }, (_, i) => i));
  const stepperRef = useRef<HTMLDivElement>(null);
  const activeStepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = stepperRef.current;
    const activeElement = activeStepRef.current;
    
    if (container && activeElement) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = activeElement.getBoundingClientRect();
      
      const isVisible = 
        elementRect.left >= containerRect.left &&
        elementRect.right <= containerRect.right;

      if (!isVisible) {
        // Рассчитываем позицию для скролла
        const scrollLeft = 
          container.scrollLeft + 
          elementRect.left - 
          containerRect.left - 
          (containerRect.width / 2) + 
          (elementRect.width / 2);
        
        container.scrollTo({
          left: scrollLeft,
          behavior: "smooth"
        });
      }
    }
  }, [currentStep]);

  return (
    <div className={styles.wrap} ref={stepperRef}>
      <Steps
        type="horizontal"
        size={40}
        divider
        activeStep={currentStep}
        completedSteps={completedSteps}
      >
        {steps.map((step, idx) => (
          <div 
            key={step.title} 
            ref={idx === currentStep ? activeStepRef : null}
          >
            <Step idx={idx} title={step.title} />
          </div>
        ))}
      </Steps>
    </div>
  );
};