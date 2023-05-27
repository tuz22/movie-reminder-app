import React from 'react';
import {
    SafeAreaView,
    FlatList,
    StyleSheet,
    View,
    Platform,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import Movie from './Movie';
import useMovies from './useMovies';
import Colors from 'open-color';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.black,
    },
    movieList: {
        padding: 20,
    },
    separator: {
        height: 16,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

const MoviesScreen = () => {
    const { movies, isLoading, loadMore, canLoadMore, refresh } = useMovies();
    return (
        <SafeAreaView style={styles.container}>
            {Platform.OS === 'ios' ? (
                <StatusBar barStyle="light-content" />
            ) : (
                <StatusBar barStyle="dark-content" />
            )}

            {/* ActivityIndicator: 로딩바 */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator />
                </View>
            ) : (
                <FlatList
                    contentContainerStyle={styles.movieList} // 플렛리스트 안에 스타일 줌
                    data={movies}
                    renderItem={({ item: movie }) => (
                        <Movie
                            title={movie.title}
                            originalTitle={movie.originalTitle}
                            releaseDate={movie.releaseDate}
                            overview={movie.overview}
                            posterUrl={movie.posterUrl ?? undefined}
                        />
                    )}
                    ItemSeparatorComponent={() => (
                        <View style={styles.separator} />
                    )} // 아이템 간 스타일 줌
                    onEndReached={() => {
                        // 제일 아래에 닿을 때
                        if (canLoadMore) {
                            loadMore();
                        }
                    }}
                    refreshControl={
                        <RefreshControl
                            tintColor={Colors.white} // ios 로딩아이콘색 android는 colors
                            refreshing={isLoading}
                            onRefresh={refresh}
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
};

export default MoviesScreen;
