import { useCallback, useEffect, useState } from 'react';
import notifee, {
    AndroidImportance,
    AuthorizationStatus,
    AndroidNotificationSetting,
    TimestampTrigger,
    TriggerType,
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
                timestamp: moment().add(5, 'seconds').valueOf(), // moment(releaseDate).valueOf(), // releaseDate때 푸시알림 발송
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

    return {
        addReminder,
    };
};

export default useReminder;
