import { useAuth } from '../../context/AuthContext';
import { Icons } from '../Icons/Icons';
import './Header.css';

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="header">
      <div className="header-search">
        <div className="search-icon">
        </div>
        
      </div>

      <div className="header-actions">
        

        <div className="user-menu">
          <button className="user-btn">
            <div className="user-avatar">
              {user?.nombre?.charAt(0) || 'A'}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;