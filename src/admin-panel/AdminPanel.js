import { useLocation } from "react-router-dom";
import { ResponsiveAppBar } from "./header";
import { Dashboard } from "./Dashboard";
import { Clients } from "./Clients";
import { Statistics } from "./Statistics";

export const AdminPanel = () => {
    const location = useLocation();
    const pageId = location.pathname.split("/")[3];

    return (
        <div>
            <ResponsiveAppBar/>
            <div>
                {pageId === 'dashboard' && <Dashboard />}
                {pageId === 'statistics' && <Statistics />}
                {pageId === 'clients' && <Clients />}
            </div>
        </div>
    );
};
