import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";
import { onAuthStateChanged, getAuth } from 'firebase/auth'

// Creating a context for authentication state
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [ user, setUser ] = useState(null);

    // Performing side effect to monitor authentication state changes
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user)
            } else {
                setUser(null)
            }
        })

        return unsubscribe
    }, [])

    // Providing authentication state to children components through context
    return (
        <AuthContext.Provider value={user}>
            {children}
        </AuthContext.Provider>
    )
}

// Exporting a hook for accessing authentication state
export const useAuth = () => useContext(AuthContext);