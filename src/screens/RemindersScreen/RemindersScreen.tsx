import React from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
} from 'react-native';
import Colors from 'open-color';
import useReminder from '../../hooks/useReminder';
import Screen from '../../components/Screen';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialIcons';

const styles = StyleSheet.create({
    reminderList: {
        padding: 20,
    },
    reminderItem: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        borderColor: Colors.gray[6],
        flexDirection: 'row',
    },
    textContainer: {
        flex: 1,
    },
    nullTextContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleText: {
        fontSize: 18,
        color: Colors.white,
        fontWeight: 'bold',
    },
    bodyText: {
        marginTop: 2,
        fontSize: 14,
        color: Colors.white,
    },
    timestampText: {
        marginTop: 2,
        fontSize: 14,
        color: Colors.white,
    },
    separator: {
        height: 8,
    },
    removeReminderContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeReminderIcon: {
        color: Colors.white,
        fontSize: 24,
    },
});

const RemindersScreen = () => {
    const { reminders, removeReminder } = useReminder();

    console.log('reminders', reminders.length);
    if (reminders.length < 1) {
        console.log('푸시없음');
    }

    return (
        <Screen>
            {reminders.length < 1 ? (
                // <View style={styles.reminderItem}>
                <View style={styles.nullTextContainer}>
                    <Text style={styles.titleText}>
                        등록된 푸시 알림이 없습니다.
                    </Text>
                </View>
            ) : (
                // </View>
                //
                <FlatList
                    contentContainerStyle={styles.reminderList}
                    data={reminders}
                    renderItem={({ item: reminder }) => {
                        return (
                            <View style={styles.reminderItem}>
                                <View style={styles.textContainer}>
                                    <Text style={styles.titleText}>
                                        {reminder.notification.body}
                                    </Text>
                                    {'timestamp' in reminder.trigger && ( // reminder의 trigger가 'timestamp'일 때만
                                        <Text style={styles.timestampText}>
                                            {moment(
                                                reminder.trigger.timestamp,
                                            ).format('LLL')}
                                        </Text>
                                    )}
                                </View>
                                <View style={styles.removeReminderContainer}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (
                                                reminder.notification.id != null
                                            ) {
                                                removeReminder(
                                                    reminder.notification.id,
                                                );
                                            }
                                        }}>
                                        <Icon
                                            style={styles.removeReminderIcon}
                                            name="notifications-off"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    }}
                    ItemSeparatorComponent={() => (
                        <View style={styles.separator} />
                    )}
                />
            )}
        </Screen>
    );
};

export default RemindersScreen;
