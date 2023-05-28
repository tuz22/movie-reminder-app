import { useCallback, useEffect, useState } from 'react';
import notifee, {
    AndroidImportance,
    AuthorizationStatus,
    AndroidNotificationSetting,
    TimestampTrigger,
    TriggerType,
    TriggerNotification,
} from '@notifee/react-native';
import { Platform } from 'react-native';
import moment from 'moment';

const useReminder = () => {
    const [channelId, setChannelId] = useState<string | null>(null);
    // 채널 생성
    useEffect(() => {
        (async () => {
            if (Platform.OS === 'android') {
                const id = await notifee.createChannel({
                    id: 'default',
                    name: 'Default Channel',
                    importance: AndroidImportance.HIGH,
                });
                setChannelId(id);
            } else {
                setChannelId('ios-fake-channel-id');
            }
        })();
    }, []);

    // 푸쉬 예약
    const addReminder = useCallback(
        async (movieId: number, releaseDate: string, title: string) => {
            const settings = await notifee.requestPermission();

            if (settings.authorizationStatus < AuthorizationStatus.AUTHORIZED) {
                // AUTHORIZED == 1, -1 or 0이 나오면 권한 못받은 것
                throw new Error('Permission is denied');
            }

            if (Platform.OS === 'android') {
                if (
                    settings.android.alarm !==
                    AndroidNotificationSetting.ENABLED
                ) {
                    // 사용자가 설정에서 알림 허용을 안했을 때
                    throw new Error(
                        'Please allow setting alarms and reminder on settings',
                    );
                }
            }

            if (channelId == null) {
                // 채널Id가 없을 때
                throw new Error('Channel is not created');
            }

            // Create a time-based trigger
            const trigger: TimestampTrigger = {
                type: TriggerType.TIMESTAMP,
                // timestamp: moment().add(5, 'seconds').valueOf(), // 5초 뒤 푸시알림 발송
                timestamp: moment(releaseDate).valueOf(), // releaseDate때 푸시알림 발송
            };

            // Create a trigger notification
            await notifee.createTriggerNotification(
                {
                    id: `${movieId}`,
                    title: '영화 개봉일 알림',
                    body: title,
                    android: {
                        channelId: channelId,
                    },
                },
                trigger,
            );
        },
        [channelId],
    );

    // 알림 리스트 불러오기
    const [reminders, setReminders] = useState<TriggerNotification[]>([]);
    const loadReminders = useCallback(async () => {
        // 3. loadReminders는 다시 읽어온 다음
        const notifications = await notifee.getTriggerNotifications(); // 4. notifications을 업데이트
        setReminders(notifications);
    }, []);

    useEffect(() => {
        loadReminders();
    }, [loadReminders]);

    // 알림 취소
    const removeReminder = useCallback(
        async (id: string) => {
            await notifee.cancelTriggerNotification(id); // 1. 알림을 삭제하고
            await loadReminders(); // 2. loadReminders를 하고
        },
        [loadReminders],
    );

    return {
        addReminder,
        reminders,
        removeReminder,
    };
};

export default useReminder;
