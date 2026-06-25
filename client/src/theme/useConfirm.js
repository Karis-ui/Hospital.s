import { useState, useCallback } from "react";
import ConfirmDialog from "./ConfirmDialog";

export const useConfirm = () => {
    const [state, setState] = useState({
        open: false,
        title: '',
        message: '',
        onConfirm: null,
        onCancel: null,
        type: 'warning',
        confirmText: 'Confirm',
        confirmColor: 'primary',
    });

    const confirm = useCallback((options) => {
        return new Promise((resolve) => {
            setState({
                open: true,
                title: options.title || 'Confirm Action',
                message: options.message || 'Are you sure you want to proceed?',
                type: options.type || 'warning',
                confirmText: options.confirmText || 'Confirm',
                confirmColor: options.confirmColor || 'primary',
                onConfirm: () => {
                    resolve(true);
                    setState(prev => ({ ...prev, open: false }));
                },
                onCancel: () => {
                    resolve(false);
                    setState(prev => ({ ...prev, open: false }));
                },
            });
        });
    }, []);

    const ConfirmDialogComponent = () => (
        <ConfirmDialog
            open={state.open}
            title={state.title}
            message={state.message}
            type={state.type}
            confirmText={state.confirmText}
            confirmColor={state.confirmColor}
            onConfirm={state.onConfirm}
            onCancel={state.onCancel}
        />
    );
    return { confirm, ConfirmDialogComponent };
};

export default useConfirm;