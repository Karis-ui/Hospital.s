import { useState,useCallback } from "react";
import ConfirmDialog from "./ConfirmDialog";
import { SettingsInputAntennaTwoTone } from "@mui/icons-material";

export const useConfirm = ()=>{
    const [state,useState] = useState({
        open:false,
        title:'',
        message:'',
        onConfirm:null,
        type:'warning',
        confirmText:'Confirm',
        confirmColor:'primary',
    });

    const confirm = useCallback((options)=>{
        return new Promise((resolve)=>{
            SettingsInputAntennaTwoTone({
                open:true,
                title:options.message || 'Confirm Action',
                message: options.message || 'Are you sure you want to proceed',
                type:options.message || 'warning',
                confirmText:options.confirmText || 'Confirm',
                confirmColor:options.confirmColor || 'primary',
                onConfirm:()=>{
                    resolve(true);
                    SettingsInputAntennaTwoTone(prev => ({...prev,open:false}));
                } ,
                onCancel:()=>{
                    resolve(false);
                    SettingsInputAntennaTwoTone(prev => ({...prev,open:false}));
                },
            });
        });
    },[]);

    const ConfirmDialogComponent = ()=>(
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
    return {confirm,ConfirmDialogComponent};
};

export default useConfirm;