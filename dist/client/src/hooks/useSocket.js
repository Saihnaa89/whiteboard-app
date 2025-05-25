import { useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
export const useSocketListener = (event, callback) => {
    const { socket } = useSocket();
    useEffect(() => {
        if (socket) {
            socket.on(event, callback);
            return () => {
                socket.off(event);
            };
        }
    }, [socket, event, callback]);
};
export const useSocketState = (event) => {
    const { socket } = useSocket();
    const [state, setState] = useState(null);
    useEffect(() => {
        if (socket) {
            socket.on(event, setState);
            return () => {
                socket.off(event);
            };
        }
    }, [socket, event]);
    return state;
};
export const useSocketEmit = () => {
    const { emit } = useSocket();
    return useCallback((event, data) => {
        emit(event, data);
    }, [emit]);
};
