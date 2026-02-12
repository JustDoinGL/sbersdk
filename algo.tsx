import SmoothScroll from 'smooth-scroll';

class Scroll {
    attr: string;
    
    constructor(attr = 'scroll') {
        this.attr = attr;
        this.handleClick = this.handleClick.bind(this);
    }

    init() {
        this.setEventListeners();
        // Даем время на загрузку DOM перед проверкой hash
        setTimeout(() => this.scrollFromHashIfNeeded(), 100);
    }

    setEventListeners() {
        document.addEventListener('click', this.handleClick);
    }

    handleClick({ target }: { target: any }) {
        const scrollTarget = target?.dataset?.[this.attr];
        if (scrollTarget) {
            // Предотвращаем стандартное поведение
            event?.preventDefault();
            return this.performScroll(scrollTarget);
        }
        return false;
    }

    scrollFromHashIfNeeded() {
        const hash = window.location.hash;
        if (!hash) return;
        
        // Убираем # из начала
        const targetId = hash.slice(1);
        this.performScroll(`#${targetId}`);
    }

    waitForElement(selector: string, callback: () => void) {
        // Сначала проверяем, существует ли элемент
        const element = document.querySelector(selector);
        if (element) {
            callback();
            return;
        }

        // Если нет, ждем его появления
        const observer = new MutationObserver(() => {
            const el = document.querySelector(selector);
            if (el) {
                observer.disconnect();
                callback();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    performScroll(anchor: string) {
        this.waitForElement(anchor, () => {
            new SmoothScroll(null, {
                speed: 300,
                speedAsDuration: true,
                updateURL: false
            }).animateScroll(anchor);
        });
    }
}

export default Scroll;