import { useLocation } from 'react-router-dom';

// Кастомный хук для проверки нескольких путей
const useIsActivePaths = (paths) => {
  const location = useLocation();
  return paths.some(path => location.pathname.startsWith(path));
};

// Использование в компоненте
const SalesPointNav = () => {
  const isActive = useIsActivePaths(['/sales-points', '/sales', '/points']);
  
  return (
    <NavLink
      data-test-id={"salesPointPart"}
      className={classes([styles.nav, [isActive, styles.active]])}
      to={Routes.SALES_POINTS}
    >
      <SalesPointIcon />
    </NavLink>
  );
};