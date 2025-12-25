import { getPhoneNumber, getPhoneParts } from "@/4_entities/client";
import { api, PhoneDto } from "@/5_shared/api";
import { PlusIcon } from "@/5_shared/icons";
import { ErrorMessage } from "@/5_shared/ui";
import { CallToButton } from "@/features/CallToButton/ui";
import { Button, InputPhone, Radio, useToast } from "@sg/ui-kit";
import { FC, useRef, useState } from "react";
import styles from "./edit_client_phones.module.css";

type Props = {
    phones: PhoneDto[];
    clientId: number;
};

export const EditClientPhones: FC<Props> = ({ phones, clientId }) => {
    const mappedPhones = phones.map((phoneDto) => ({
        id: phoneDto.id,
        number: getPhoneNumber(phoneDto),
        origin: phoneDto,
    }));

    // Реф для хранения оригинальных значений телефонов
    const originalPhonesRef = useRef<PhoneDto[]>(phones);
    
    const [phonesList, setPhonesList] = useState(mappedPhones);
    const [main, setMain] = useState(phones.find((phone) => phone.main)?.id);
    const [isOpen, setIsOpen] = useState(false);
    const [newPhoneNumber, setNewPhoneValue] = useState("");
    const [error, setError] = useState<Error | null>(null);
    const { push } = useToast();

    // Функция для проверки изменился ли номер телефона
    const hasPhoneChanged = (phoneId: number, newPhoneNumber: string): boolean => {
        const originalPhone = originalPhonesRef.current.find(phone => 
            phone.id === phoneId
        );
        
        if (!originalPhone) return false;
        
        const originalFormattedNumber = getPhoneNumber(originalPhone);
        return originalFormattedNumber !== newPhoneNumber;
    };

    return (
        <div className={styles.wrapper}>
            {phonesList.map((phone) => {
                const phoneId = phone.id;
                if (!phoneId) {
                    return null;
                }

                return (
                    <div className={styles.phoneContainer} key={phoneId}>
                        <InputPhone
                            data-test-id="phone-input"
                            value={phone.number}
                            autoComplete="off"
                            onChange={(e) => {
                                // Можно добавить логику обновления локального состояния
                                // если нужно отслеживать изменения в реальном времени
                            }}
                            onBlur={async (e) => {
                                const newPhoneValue = e.target.value;
                                
                                // Проверяем, изменилось ли значение
                                if (!hasPhoneChanged(phoneId, newPhoneValue)) {
                                    return; // Ничего не делаем если не изменилось
                                }
                                
                                try {
                                    await api.cdi.getPhoneValidation({
                                        phone: newPhoneValue,
                                    });
                                    
                                    const { city_code, country_code, number } = getPhoneParts(
                                        newPhoneValue,
                                    );
                                    
                                    const enrichedPhone: Parameters<
                                        typeof api.client_methods.patchPhoneById
                                    >[number]["phone"] = {
                                        ...phone.origin,
                                        city_code,
                                        country_code,
                                        number,
                                        client: clientId,
                                    };
                                    
                                    const response = await api.client_methods.patchPhoneById({
                                        id: phoneId.toString(),
                                        phone: enrichedPhone,
                                    });
                                    
                                    // Обновляем список телефонов
                                    setPhonesList((prev) =>
                                        prev.map((p) => {
                                            if (p.id === phoneId) {
                                                return {
                                                    ...p,
                                                    number: getPhoneNumber(response),
                                                    origin: response,
                                                };
                                            }
                                            return p;
                                        })
                                    );
                                    
                                    // Обновляем реф с оригинальными значениями
                                    originalPhonesRef.current = originalPhonesRef.current.map(p => 
                                        p.id === response.id ? response : p
                                    );
                                    
                                    push({
                                        title: "Телефон обновлен",
                                        type: "positive",
                                    });
                                } catch (error) {
                                    console.error(error);
                                    // Восстанавливаем старое значение в инпуте
                                    e.target.value = phone.number;
                                    push({
                                        title: "Ошибка при обновлении",
                                        type: "error",
                                    });
                                }
                            }}
                        />
                        
                        <Radio
                            hint="основной"
                            data-test-id="phone-radio"
                            checked={phone.id === main}
                            onClick={async () => {
                                try {
                                    await api.client_methods.patchPhoneById({
                                        id: phoneId.toString(),
                                        phone: { ...phone.origin, client: clientId, main: true },
                                    });
                                    setMain(phone.id);
                                    push({
                                        title: "Основной телефон установлен",
                                        type: "positive",
                                    });
                                } catch (error) {
                                    console.error(error);
                                    push({
                                        title: "Не удалось установить основной телефон",
                                        type: "error",
                                    });
                                }
                            }}
                        />
                        
                        <CallToButton
                            className={styles.callButton}
                            href={getPhoneNumber(phone.origin, "+7XXXXXXXXXX")}
                        />
                    </div>
                );
            })}
            
            {isOpen && (
                <div className={styles.phoneContainer}>
                    <InputPhone
                        data-test-id="new-phone-input"
                        autoFocus
                        autoComplete="off"
                        onClear={() => {
                            setNewPhoneValue("");
                            setError(null);
                            setIsOpen(false);
                        }}
                        value={newPhoneNumber}
                        onChange={(e) => {
                            setNewPhoneValue(e.target.value);
                        }}
                        onBlur={async () => {
                            if (newPhoneNumber.length !== 18) {
                                setError(new Error("Некорректный номер телефона"));
                                return;
                            }
                            
                            try {
                                await api.cdi.getPhoneValidation({
                                    phone: newPhoneNumber,
                                });
                            } catch (error) {
                                console.error(error);
                                setError(new Error("Некорректный номер телефона"));
                                return;
                            }
                            
                            const { city_code, country_code, number } =
                                getPhoneParts(newPhoneNumber);
                            
                            const phoneDto = {
                                city_code,
                                country_code,
                                number,
                                client: clientId,
                                phone_type: 1,
                            };
                            
                            try {
                                const response = await api.client_methods.postPhone(phoneDto);
                                setError(null);
                                setNewPhoneValue("");
                                
                                // Добавляем новый телефон в список
                                setPhonesList((prev) => [
                                    ...prev,
                                    {
                                        id: response.id,
                                        number: getPhoneNumber(response),
                                        origin: response,
                                    },
                                ]);
                                
                                // Обновляем реф с оригинальными значениями
                                originalPhonesRef.current = [...originalPhonesRef.current, response];
                                
                                setIsOpen(false);
                                push({
                                    title: "Телефон добавлен",
                                    type: "positive",
                                });
                            } catch (error) {
                                setError(error as Error);
                                push({
                                    title: "Не удалось добавить телефон",
                                    type: "error",
                                });
                            }
                        }}
                        hasError={Boolean(error)}
                    />
                    {error?.message && <ErrorMessage error={error.message} />}
                </div>
            )}
            
            {!isOpen && (
                <Button
                    variant="link"
                    size="s"
                    before={<PlusIcon />}
                    onClick={() => setIsOpen(true)}
                >
                    Добавить телефон
                </Button>
            )}
        </div>
    );
};