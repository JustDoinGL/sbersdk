import { useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import styles from "../sms_step.module.css";
import { Input, Text } from "@sg/ukkit";
import cn from "classnames";

const INPUT_IDS = ["digit-0", "digit-1", "digit-2", "digit-3", "digit-4", "digit-5"];

type Props = {
  handleNextStep: () => void;
};

type FormData = {
  digits: string[];
};

export const SmsCodeForm: React.FC<Props> = ({ handleNextStep }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      digits: ["", "", "", "", "", ""]
    }
  });

  const digits = watch("digits");

  const handleSendCode = async (code: string) => {
    console.log(code);
    
    if (code === "111111") {
      handleNextStep();
    } else {
      setError("root", { message: "Неверный код. Проверьте правильность и попробуйте ещё раз" });
    }
  };

  const onSubmit = (data: FormData) => {
    const code = data.digits.join("");
    handleSendCode(code);
  };

  useEffect(() => {
    const code = digits.join("");
    if (code.length === 6) {
      handleSubmit(onSubmit)();
    }
  }, [digits]);

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedText = event.clipboardData.getData("text/plain").trim();
    const pastedDigits = pastedText.replace(/\D/g, "").split("").slice(0, 6);

    pastedDigits.forEach((digit, index) => {
      setValue(`digits.${index}`, digit);
    });

    const nextFocusIndex = Math.min(pastedDigits.length, 5);
    inputRefs.current[nextFocusIndex]?.focus();
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    clearErrors("root");

    if (event.key === "Backspace") {
      if (!digits[index] && index > 0) {
        setValue(`digits.${index - 1}`, "");
        inputRefs.current[index - 1]?.focus();
      }
    } else if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < 5) {
      event.preventDefault();
      inputRefs.current[index + 1]?.focus();
    } else if (/\d/.test(event.key)) {
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const setInputRef = (index: number) => (element: HTMLInputElement | null) => {
    inputRefs.current[index] = element;
  };

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        {INPUT_IDS.map((id, index) => (
          <Input
            key={id}
            {...register(`digits.${index}`, {
              required: true,
              pattern: /^[0-9]$/
            })}
            ref={(element) => {
              setInputRef(index)(element);
            }}
            autoFocus={index === 0}
            placeholder="0"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            onPaste={handlePaste}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onFocus={(event) => event.currentTarget.select()}
            autoComplete="one-time-code"
            style={{ width: "52px", height: "68px", padding: "22px 20px" }}
            hasError={!!errors.root}
          />
        ))}
      </form>
      {errors.root && (
        <div className={cn(styles.error, styles.errorVisible)}>
          <Text font="caption_1" color="#FF0239" align="center">
            {errors.root.message}
          </Text>
        </div>
      )}
    </>
  );
};