import { Octokit } from '@octokit/rest'
import React from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Loader } from '../components/loader'
import { NavBar } from '../components/navbar'
import { Pagination } from '../components/pagination'

const octokit = new Octokit()
const perPage = 10

interface AppFormCollection extends HTMLFormControlsCollection {
    search: HTMLInputElement
}

interface RepoInfo {
    name: string
    /** for some reason owner is nullable, though I didn't find in which cases it's possible */
    owner: string | null
    description: string | null
}

export function Search() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const formRef = React.useRef<HTMLFormElement>(null)
    const [repos, setRepos] = React.useState<RepoInfo[]>([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [totalItems, setTotalItems] = React.useState(0)
    const handleSubmit: React.FormEventHandler = React.useCallback(
        async (e) => {
            e.preventDefault()
            if (formRef.current) {
                const form = formRef.current.elements as AppFormCollection
                const query = new URLSearchParams()
                query.append('q', form.search.value)
                navigate({ search: query.toString() })
            }
        },
        []
    )
    React.useEffect(() => {
        const search = searchParams.get('q')
        if (!search) return
        setLoading(true)
        octokit.search
            .repos({
                q: search,
                page: Number(searchParams.get('page') || 0),
                per_page: perPage,
            })
            .then((result) => {
                setTotalItems(result.data.total_count)
                const reposResult = result.data.items.map<RepoInfo>((item) => ({
                    name: item.name,
                    owner: item.owner?.login || null,
                    description: item.description,
                }))
                setRepos(reposResult)
                setError(null)
            })
            .catch((e) => {
                console.error(e)
                setRepos([])
                setError(`Oops, error ${e}`)
            })
            .finally(() => {
                setLoading(false)
            })
    }, [searchParams])

    return (
        <>
            <NavBar active="search" />
            <div className="container">
                <h1 className="is-size-3">Search repositories</h1>
                <form
                    className="level mt-5"
                    ref={formRef}
                    onSubmit={handleSubmit}
                >
                    <input
                        className="input mr-3"
                        type="text"
                        name="search"
                        id="search"
                        defaultValue={searchParams.get('q') || ''}
                    />
                    <button className="button mt-3">Search</button>
                </form>
                <Loader show={loading} />
                {error && <h2> {error} </h2>}
                <div className="content">
                    <ul>
                        {repos.map((repo) => (
                            <li key={`${repo.owner}/${repo.name}`}>
                                <Link
                                    className="is-size-4"
                                    to={`/repo/${repo.owner}/${repo.name}`}
                                >
                                    {`${repo.owner}/${repo.name}`}
                                </Link>
                                <p>{repo.description}</p>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="mb-5">
                    <Pagination
                        total={totalItems}
                        perPage={perPage}
                        currentPage={Number(searchParams.get('page') || 1)}
                    />
                </div>
            </div>
        </>
    )
}
