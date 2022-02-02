import { Link } from 'react-router-dom'

interface Props {
    total: number
    perPage: number
    currentPage: number
}
export const Pagination: React.FC<Props> = (props) => {
    const totalPages = Math.ceil(props.total / props.perPage)
    if (totalPages < 2) {
        return null
    }

    function getClassName(p: number) {
        return p === props.currentPage
            ? 'pagination-link is-current'
            : 'pagination-link'
    }

    if (totalPages < 7) {
        return (
            <nav className="pagination" role="navigation">
                <ul className="pagination-list">
                    {range(1, totalPages).map((p) => (
                        <li key={p}>
                            <Link
                                className={getClassName(p)}
                                to={makePageUrl(window.location.href, p)}
                            >
                                {p}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        )
    }

    const pages = range(
        Math.max(props.currentPage - 2, 2),
        Math.min(props.currentPage + 2, totalPages - 1)
    )
    const showFirstEllipsis = pages[0] > 2
    const showLastEllipsis = pages[pages.length - 1] < totalPages - 2
    return (
        <nav className="pagination" role="navigation">
            <ul className="pagination-list">
                <Link
                    className={getClassName(1)}
                    to={makePageUrl(window.location.href, 1)}
                >
                    {1}
                </Link>
                {showFirstEllipsis && (
                    <li>
                        <span className="pagination-ellipsis">&hellip;</span>
                    </li>
                )}
                {pages.map((p) => (
                    <Link
                        className={getClassName(p)}
                        to={makePageUrl(window.location.href, p)}
                    >
                        {p}
                    </Link>
                ))}
                {showLastEllipsis && (
                    <li>
                        <span className="pagination-ellipsis">&hellip;</span>
                    </li>
                )}
                <li>
                    <Link
                        className={getClassName(totalPages)}
                        to={makePageUrl(window.location.href, totalPages)}
                    >
                        {totalPages}
                    </Link>
                </li>
            </ul>
        </nav>
    )
}

function makePageUrl(baseUrl: string, page: number) {
    const url = new URL(baseUrl)
    const params = new URLSearchParams(url.searchParams)
    params.set('page', String(page))
    return `${url.pathname}?${params.toString()}`
}

/**
 * Creates an array of numbers from `start` to `end` inclusive.
 * If only on argument is given returns an array of that length starting from 0
 */
function range(start: number, end?: number) {
    if (end === undefined) {
        end = start - 1
        start = 0
    }

    return Array.from({ length: end - start + 1 }).map((_, i) => i + start)
}
