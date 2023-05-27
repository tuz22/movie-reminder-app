import React, { useCallback } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Screen from '../../components/Screen';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import useMovie from './useMovie';
import Colors from 'open-color';
import Section from './Section';
import People from './People';

const styles = StyleSheet.create({
    loadingContainer: {
        felx: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        padding: 20,
    },
    titleSection: {
        flexDirection: 'row',
    },
    poster: {
        width: 100,
        height: 150,
        backgroundColor: Colors.gray[3],
    },
    infoTexts: {
        flex: 1,
        marginLeft: 20,
    },
    titleTexts: {
        flex: 1,
    },
    titleText: {
        fontSize: 30,
        color: Colors.white,
        fontWeight: 'bold',
    },
    originalTitleText: {
        marginTop: 2,
        fontSize: 14,
        color: Colors.white,
    },
    releaseDateText: {
        marginTop: 4,
        fontSize: 16,
        color: Colors.white,
    },
    overviewText: {
        fontSize: 14,
        color: Colors.white,
    },
    separator: {
        width: 16,
    },
    verticalSeparator: {
        height: 16,
    },
});

// 해당 영화 정보를 불러오는 페이지
const MovieScreen = () => {
    const {
        params: { id },
    } = useRoute<RouteProp<RootStackParamList, 'Movie'>>();

    const { movie, isLoading } = useMovie({ id });

    const renderMovie = useCallback(() => {
        if (movie == null) {
            console.log('movie is null');
            return null;
        }

        const {
            posterUrl,
            title,
            originalTitle,
            releaseDate,
            overview,
            crews,
        } = movie;

        const director = crews.find(crew => crew.job === 'Director');
        return (
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.titleSection}>
                    <View style={styles.poster}>
                        {posterUrl != null && (
                            <Image
                                style={styles.poster}
                                source={{ uri: posterUrl }}
                            />
                        )}
                    </View>
                    <View style={styles.infoTexts}>
                        <View style={styles.titleTexts}>
                            <Text style={styles.titleText}>{title}</Text>
                            <Text style={styles.originalTitleText}>
                                {originalTitle}
                            </Text>
                        </View>
                        <Text
                            style={
                                styles.releaseDateText
                            }>{`개봉일: ${releaseDate}`}</Text>
                    </View>
                </View>
            </ScrollView>
        );
    }, [movie]);
    return (
        <Screen>
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator />
                </View>
            ) : (
                renderMovie()
            )}
        </Screen>
    );
};

export default MovieScreen;