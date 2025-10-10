import { FC, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import styles from "./activity.module.css";
import { Buttons } from "./buttons";

// Предполагаем, что у вас есть хук useToast
// import { useToast } from "path/to/useToast";

interface ActivityDto {
  id: string;
  deal?: any;
  // добавьте другие поля по необходимости
}

const VIEW_OPTIONS = [
  { value: "", label: "Активность" },
  { value: "ActivityClientMobile", label: "Клиент" },
  { value: "ActivityDealMobile", label: "Сделка" },
  { value: "ActivityContractMobile", label: "Договор" },
];

export const ActivityMobile: FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // const { push } = useToast(); // раскомментируйте если используете тосты
  console.log(location);
  
  const [activity, setActivity] = useState<ActivityDto | null>(null);
  const [view, setView] = useState(() => {
    const pathParts = location.pathname.split("/");
    return pathParts[pathParts.length - 1] || "";
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadDeal = async (id: string) => {
    setIsLoading(true);
    try {
      // Ваша логика загрузки данных
      // const response = await api.getActivity(id);
      // setActivity(response.data);
    } catch (error) {
      console.error("Error loading activity:", error);
      // push("Ошибка загрузки"); // раскомментируйте если используете тосты
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewChange = (newView: string) => {
    setView(newView);
    if (id) {
      const basePath = `/activity/${id}`;
      const targetPath = newView ? `${basePath}/${newView}` : basePath;
      
      navigate(targetPath, { 
        replace: true,
        state: { deal: activity?.deal } 
      });
    }
  };

  useEffect(() => {
    if (id) {
      handleLoadDeal(id);
    }
  }, [id]);

  useEffect(() => {
    // Обновляем view при изменении пути
    const pathParts = location.pathname.split("/");
    const currentView = pathParts[pathParts.length - 1];
    setView(currentView === id ? "" : currentView);
  }, [location.pathname, id]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Buttons
          options={VIEW_OPTIONS}
          value={view}
          onChange={handleViewChange}
        />
      </div>
      
      <div className={styles.content}>
        {isLoading ? (
          <div>Загрузка...</div>
        ) : (
          <Outlet />
        )}
      </div>
    </