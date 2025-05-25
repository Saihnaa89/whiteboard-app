import { createContext, useContext } from 'react';
const SocketContext = createContext(undefined);
export function useSocket() {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
}
export default SocketContext;
