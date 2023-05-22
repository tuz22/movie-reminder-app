import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Movie } from '../../types';
import { getDiscoverMovies } from '../../modules/ApiRequest';
import moment from 'moment';

const useMovies = () => {
    const getUpcomingMovies = useCallback(async () => {
        const result = await getDiscoverMovies({
            releaseDateGte: moment().format('YYYY-MM-DD'),
            releaseDateLte: moment().add(1, 'years').format('YYYY-MM-DD'),
        });

        return result;
    }, []);

    const { data, isLoading } = useQuery({
        queryKey: ['upcoming-movies'],
        queryFn: getUpcomingMovies,
    });

    const movies = data?.results ?? []; // data가 null || undefined이면 [], 아니면 movies 반환

    return {
        movies,
        isLoading,
    };
};

export default useMovies;
