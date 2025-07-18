import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import classNames from 'classnames/bind';
import styles from './styles.module.css';
import { useAnimation, useInView, motion } from 'framer-motion'; // Исправлен импорт из 'motion/react' на 'framer-motion'

const cx = classNames.bind(styles);
const CLASS_NAME = 'SlideSerializer';

type TSectionProps = {
    item: React.ReactNode;
    segment: string;
    index: number;
    isLast: boolean;
    setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
};

type TSectionRef = {
    // Здесь можно добавить методы, которые будут доступны через ref
    scrollIntoView: () => void;
};

const Section = forwardRef<TSectionRef, TSectionProps>(({ 
    item, 
    segment, 
    index, 
    isLast, 
    setActiveIndex 
}, ref) => {
    const controls = useAnimation();
    const sectionRef = React.useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef, {
        amount: 0.9
    });

    // Предоставляем методы наружу через ref
    useImperativeHandle(ref, () => ({
        scrollIntoView: () => {
            sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }));

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
        visible: { 
            opacity: 1, 
            scale: 1,
            transition: { duration: 0.5 } 
        },
        hidden: { 
            opacity: 0, 
            scale: 0.9,
            transition: { duration: 0.5 } 
        }
    };

    return (
        <motion.section
            ref={sectionRef}
            id={index.toString()}
            className={cx(
                `${CLASS_NAME}__section`,
                index === 0 && `${CLASS_NAME}__section--first`,
                isLast && `${CLASS_NAME}__section--last`
            )}
            initial="hidden"
            animate={controls}
            variants={variants}
        >
            {item}
        </motion.section>
    );
});

Section.displayName = 'Section'; // Для отладки в React DevTools

export default Section;