export const EditClientMails: FC<Props> = ({ mails, clientId }) => {
    const [mailsList, setMailsList] = useState(mails);
    const [main, setMain] = useState(mails.find((mail) => mail.main)?.id);
    const [values, setValues] = useState<Record<string, string>>(
        mails.reduce((acc, rec) => {
            if (rec.id) {
                Object.assign(acc, { [rec.id.toString()]: rec.email });
            }
            return acc;
        }, {})
    );
    const [newMail, setNewMailValue] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    
    // Лучший нейминг для рефа, который хранит первоначальные значения
    const originalMailsRef = useRef<MailDto[]>(mails);
    const { push } = useToast();

    // Функция для проверки изменилось ли значение почты
    const hasEmailChanged = (mailId: string, newEmail: string): boolean => {
        const originalMail = originalMailsRef.current.find(mail => 
            mail.id?.toString() === mailId
        );
        return originalMail?.email !== newEmail;
    };

    return (
        <div className={styles.wrapper}>
            {mailsList.map((mail) => {
                const mailId = mail.id?.toString();
                if (!mailId) {
                    return null;
                }
                
                return (
                    <div className={styles.mailContainer} key={mailId}>
                        <Input
                            data-test-id="mail-input"
                            value={values[mailId]}
                            type="email"
                            onChange={(e) => {
                                setValues((prev) => ({ 
                                    ...prev, 
                                    [mailId]: e.target.value 
                                }));
                            }}
                            onBlur={async (e) => {
                                const newEmail = e.target.value;
                                
                                // Проверяем, изменилось ли значение
                                if (!hasEmailChanged(mailId, newEmail)) {
                                    return; // Ничего не делаем если не изменилось
                                }
                                
                                try {
                                    // Валидация email
                                    await api.cdi.getEmailValidation({
                                        email: newEmail,
                                    });
                                    
                                    const enrichedMail: Parameters<
                                        typeof api.client_methods.patchMailById
                                    >[number]["mail"] = {
                                        ...mail,
                                        email: newEmail,
                                        client: clientId,
                                    };
                                    
                                    const mailDto = await api.client_methods.patchMailById({
                                        id: parseInt(mailId),
                                        mail: enrichedMail,
                                    });
                                    
                                    // Обновляем список писем
                                    setMailsList((prev) => {
                                        return prev.map((mail) => {
                                            if (mail.id === mailDto.id) {
                                                return mailDto;
                                            }
                                            return mail;
                                        });
                                    });
                                    
                                    // Обновляем реф с оригинальными значениями
                                    originalMailsRef.current = originalMailsRef.current.map(m => 
                                        m.id === mailDto.id ? mailDto : m
                                    );
                                    
                                    push({
                                        title: "Email обновлен",
                                        type: "positive",
                                    });
                                    
                                } catch (error) {
                                    // В случае ошибки возвращаем старое значение
                                    setValues((prev) => ({ 
                                        ...prev, 
                                        [mailId]: mail.email 
                                    }));
                                    console.error(error);
                                    push({
                                        title: "Email не обновлен",
                                        type: "error",
                                    });
                                }
                            }}
                        />
                        
                        <Radio
                            hint="основной"
                            data-test-id="mail-radio"
                            checked={mail.id === main}
                            onClick={async () => {
                                try {
                                    // Логика для установки основного email
                                    await api.client_methods.patchMailById({
                                        id: mail.id,
                                        mail: {
                                            ...mail,
                                            main: true,
                                        },
                                    });
                                    
                                    setMain(mail.id);
                                    push({
                                        title: "Основной email установлен",
                                        type: "positive",
                                    });
                                    
                                } catch (error) {
                                    console.error(error);
                                    push({
                                        title: "Не удалось установить основной email",
                                        type: "error",
                                    });
                                }
                            }}
                        />
                    </div>
                );
            })}
        </div>
    );
};