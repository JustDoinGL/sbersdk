import React, { useEffect, useRef, forwardRef } from 'react';
import classNames from 'classnames/bind';
import styles from './styles.module.scss';
import { useAnimation, useInView, motion } from 'framer-motion';

const cx = classNames.bind(styles);
const CLASS_NAME = 'SlideScroller';

type TSection = {
    item: React.ReactNode;
    segment: string;
    index: number;
    isLast: boolean;
    setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
};

const Section = forwardRef<HTMLDivElement, TSection>(({ 
    item, 
    segment, 
    index, 
    isLast, 
    setActiveIndex 
}, ref) => {
    const controls = useAnimation();
    const internalRef = useRef(null);
    const isInView = useInView(internalRef, {
        amount: 0.4
    });

    useEffect(() => {
        if (index < 2) console.log(isInView);
        if (isInView) {
            controls.start('visible');
            setActiveIndex(index);
        } else {
            controls.start('hidden');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [controls, isInView]);

    const variants = {
        visible: { opacity: 1, scale: [1] },
        hidden: { scale: [0.5, 1] }
    };

    return (
        <motion.section
            id={index.toString()}
            ref={(node) => {
                internalRef.current = node;
                if (typeof ref === 'function') {
                    ref(node);
                } else if (ref) {
                    ref.current = node;
                }
            }}
            initial="hidden"
            animate={controls}
            variants={variants}
            transition={{
                duration: 1,
                ease: 'easeInOut'
            }}
            className={cx(
                `${CLASS_NAME}_section`,
                index === 0 && `${CLASS_NAME}_section_first`,
                isLast && `${CLASS_NAME}_section_last`
            )}
            key={`section-${index}-${segment}`}
        >
            {item}
        </motion.section>
    );
});

export default Section;