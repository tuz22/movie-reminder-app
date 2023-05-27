import { useCallback, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getDiscoverMovies } from '../../modules/ApiRequest';
import moment from 'moment';
import { Movie } from '../../types';

const useMovies = () => {
    const getUpcomingMovies = useCallback(async ({ pageParam = 1 }) => {
        // 초기페이지 1
        const result = await getDiscoverMovies({
            releaseDateGte: moment().format('YYYY-MM-DD'),
            releaseDateLte: moment().add(1, 'years').format('YYYY-MM-DD'),
            page: pageParam,
        });

        return result;
    }, []);

    const { data, isLoading, fetchNextPage, hasNextPage, refetch } =
        useInfiniteQuery({
            // useInfiniteQuery란? 파라미터 값만 변경해서 같은 useQuery를 무한정 호출
            queryKey: ['upcoming-movies'],
            queryFn: getUpcomingMovies,
            getNextPageParam: lastPage => {
                if (lastPage.page < lastPage.totalPages) {
                    return lastPage.page + 1;
                }
                return undefined;
            },
        });

    // data가 null || undefined이면 [], 아니면 movies 반환
    const movies = useMemo(() => {
        return data?.pages.reduce<Movie[]>((allMovies, page) => {
            return allMovies.concat(page.results); // page를 돌면서 results(movie)가 연결
        }, []);
    }, [data]);

    // 무한 스크롤
    const loadMore = useCallback(() => {
        fetchNextPage();
    }, [fetchNextPage]);

    // pull to refresh
    const refresh = useCallback(() => {
        refetch();
    }, [refetch]);

    return {
        movies,
        isLoading,
        loadMore,
        canLoadMore: hasNextPage,
        refresh,
    };
};

export default useMovies;
