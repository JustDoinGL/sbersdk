import { motion, useAnimationControls } from "framer-motion";
import { useState } from "react";

const LovelyBank = ({ id = 'LovelyBank', title, picture }) => {
    const [areCardsVisible, setAreCardsVisible] = useState(false);

    const logoVariants: Variants = {
        onscreen: {
            opacity: 1,
            scale: 1,
            top: '-10px',
            right: '-214px',
            transition: {
                delay: custom * 0.1,
                type: 'spring',
                stiffness: 50,
                damping: 10,
                onUpdate: (latest) => {
                    // Показываем карточки, когда scale > 0.5 или opacity > 0.5
                    if (latest.scale > 0.5 || latest.opacity > 0.5) {
                        setAreCardsVisible(true);
                    }
                }
            }
        }
    };

    return (
        <motion.div
            className='cx(CLASS_NAME, className)'
            id={id}
            initial='offscreen'
            whileInView='onscreen'
            viewport={{ amount: 1, once: true }}
            variants={logoVariants}
        >
            {/* Логотип */}
            <motion.img src={picture} alt={title} />

            {/* Карточки, которые становятся видимыми */}
            {areCardsVisible && (
                <div className="cards">
                    {cards.map(card => (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            {card.content}
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};