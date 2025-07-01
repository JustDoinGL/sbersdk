interface User {
  name: string;
  email: string;
}

function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (!res.ok) throw new Error("error to fetch");

        const response = await fetch("/api/user");
        const data: User = await response.json();
        setUser(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>No users</div>;

  return (
    <div>
      <h1>{user?.name}</h1> {/* Падает с ошибкой */}
      <button onClick={() => alert(user.email)}>Contact</button>
    </div>
  );
}

const sum = (num: number) => {/*...*/}


const sum = num => {
  const fn = num2 => {
    if (num2 === undefined) return num;
    return sum(num + num2);
  };
  fn.valueOf = () => num;
  fn.toString = () => num.toString();
  return fn;
};

console.log(sum(1).toString()); // 1
console.log(sum(1)(2).toString()); // 3
console.log(sum(1)(2)(3)(4).toString()); // 10



// Что будет отображено в блоке с "Значение:", если быстро (менее 2х секунд) напечатать "1234"
// Доп вопрос: что будет отображено, если быстро (зажав backspace) удалить весь текст из инпута

import React, { useState } from "react";

function InputComponent() {
    const [value, setValue] = useState("");

    const onChange = (event) => {
        setValue(event.target.value);
        setTimeout(() => {
            setValue(value);
        }, 2000);
    };

    return (
        <>
            <input  onChange={onChange} /><br />
            Значение: {value}
        </>
    );
}

export default () => <InputComponent />;