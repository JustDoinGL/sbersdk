import { useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Определяем роли
const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest'
};

const ProtectedRoute = ({ userRole, allowedRoles, children }) => {
  const navigate = useNavigate();

  useLayoutEffect(() => {
    // Проверяем, есть ли у пользователя нужная роль
    if (!allowedRoles.includes(userRole)) {
      // Перенаправляем в зависимости от роли
      switch (userRole) {
        case ROLES.ADMIN:
          navigate('/admin/dashboard');
          break;
        case ROLES.USER:
          navigate('/user/profile');
          break;
        case ROLES.GUEST:
          navigate('/login');
          break;
        default:
          navigate('/unauthorized');
      }
    }
  }, [userRole, allowedRoles, navigate]);

  // Если роль подходит, рендерим children
  if (allowedRoles.includes(userRole)) {
    return children;
  }

  // Или возвращаем null во время переадресации
  return null;
};

// Пример использования
const App = () => {
  const currentUser = {
    role: 'user' // пример роли пользователя
  };

  return (
    <ProtectedRoute 
      userRole={currentUser.role} 
      allowedRoles={[ROLES.ADMIN, ROLES.USER]} // Разрешенные роли для этого маршрута
    >
      <div>Секретный контент</div>
    </ProtectedRoute>
  );
};