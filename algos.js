import React, { useState } from 'react';

const Discount = ({ rightBotBlock, setOpenQuiz }: IDiscountProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleClick = () => {
        // Ваша логика клика
        if (setOpenQuiz) setOpenQuiz();
    };

    return (
        <a 
            className={`cx('${CLASS_NAME}') ${isHovered ? 'hovered' : ''}`}
            onClick={handleClick}
            href="think.net"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="cx('${CLASS_NAME}_img-container')">
                <picture className="cx('${CLASS_NAME}_img')" image="ding" />
            </div>
            <div className="cx('${CLASS_NAME}_container')">
                <Title 
                    level={4} 
                    text="title" 
                    theme="light" 
                    className="cx('${CLASS_NAME}_title')"
                />
                <Paragraph 
                    text="description" 
                    theme="light" 
                    className="cx('${CLASS_NAME}_description')"
                />
            </div>
        </a>
    );
};

export default Discount;