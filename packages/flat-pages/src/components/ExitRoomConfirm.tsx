import {
    CloseRoomConfirmModal,
    ExitRoomConfirmModal,
    StopClassConfirmModal,
    errorTips,
} from "flat-components";
import { observer } from "mobx-react-lite";
import React, { useCallback, useState } from "react";
import { RoomStatus } from "@netless/flat-server-api";
import { useSafePromise } from "../utils/hooks/lifecycle";
import { RouteNameType, usePushHistory } from "../utils/routes";

export enum ExitRoomConfirmType {
    StopClassButton,
    ExitButton,
}

export interface ExitRoomConfirmProps {
    isCreator: boolean;
    confirmType: ExitRoomConfirmType;
    visible: boolean;
    isReturnLoading: boolean;
    isStopLoading: boolean;
    onReturnMain: () => Promise<void>;
    onStopClass: () => Promise<void>;
    onCancel: () => void;
    confirm: (confirmType: ExitRoomConfirmType) => void;
}

export function useExitRoomConfirmModal({
    roomStatus,
    hangClass,
    stopClass,
}: {
    roomStatus: RoomStatus;
    hangClass: () => Promise<void>;
    stopClass: () => Promise<void>;
}): Omit<ExitRoomConfirmProps, "isCreator"> {
    const [confirmType, setConfirmType] = useState(ExitRoomConfirmType.ExitButton);
    const [visible, setVisible] = useState(false);
    const [isReturnLoading, setReturnLoading] = useState(false);
    const [isStopLoading, setStopLoading] = useState(false);
    const sp = useSafePromise();
    const pushHistory = usePushHistory();

    const onReturnMain = useCallback(async () => {
        setReturnLoading(true);

        try {
            await sp(hangClass());
        } catch (e) {
            setReturnLoading(false);
            console.error(e);
            errorTips(e);
        }

        pushHistory(RouteNameType.HomePage);
    }, [pushHistory, hangClass, sp]);

    const onStopClass = useCallback(async () => {
        setStopLoading(true);

        try {
            await sp(stopClass());
        } catch (e) {
            setStopLoading(false);
            console.error(e);
            errorTips(e);
        }
    }, [stopClass, sp]);

    const onCancel = useCallback(() => {
        setVisible(false);
    }, []);

    const confirm = useCallback(
        (confirmType: ExitRoomConfirmType) => {
            if (roomStatus === RoomStatus.Started || roomStatus === RoomStatus.Paused) {
                setVisible(true);
                setConfirmType(confirmType);
            } else {
                void onReturnMain();
            }
        },
        [onReturnMain, roomStatus],
    );

    // TODO:
    /**
      useEffect(() => {
        ipcReceive("window-will-close", () => {
            confirm(ExitRoomConfirmType.ExitButton);
           })

        return () => {
            ipcReceiveRemove("window-will-close");
        }
        })
    */

    return {
        confirmType,
        visible,
        isReturnLoading,
        isStopLoading,
        onReturnMain,
        onStopClass,
        onCancel,
        confirm,
    };
}

export const ExitRoomConfirm = observer<Omit<ExitRoomConfirmProps, "confirm">>(
    function ExitRoomConfirm({
        isCreator,
        confirmType,
        isReturnLoading,
        isStopLoading,
        onReturnMain,
        onStopClass,
        ...restProps
    }) {
        return isCreator ? (
            confirmType === ExitRoomConfirmType.ExitButton ? (
                <CloseRoomConfirmModal
                    {...restProps}
                    hangLoading={isReturnLoading}
                    stopLoading={isStopLoading}
                    onHang={onReturnMain}
                    onStop={onStopClass}
                />
            ) : (
                <StopClassConfirmModal
                    {...restProps}
                    loading={isStopLoading}
                    onStop={onStopClass}
                />
            )
        ) : (
            <ExitRoomConfirmModal {...restProps} onExit={onReturnMain} />
        );
    },
);

export default ExitRoomConfirm;