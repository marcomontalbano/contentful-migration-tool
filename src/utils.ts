export const pEachSeries = async <T>(iterable: T[], iterator: (value: T, index: number) => Promise<any>) => {
    let index = 0;

    for (const value of iterable) {
        try {
            await iterator(await value, index++);
        } catch (error) {
            return {
                error: error as Error,
                iterable: iterable.slice(0, index - 1)
            };
        }
    }

    return { iterable };
};
