import { Octokit } from '@octokit/rest'
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader } from '../components/loader'
import { NavBar } from '../components/navbar'

const octokit = new Octokit()

interface AppFormCollection extends HTMLFormControlsCollection {
    owner: HTMLInputElement
    repo: HTMLInputElement
}

interface Contributor {
    name: string
    avatar: string
    url: string
    contributions: number
}

export function Repo() {
    const { owner, repo } = useParams()
    let navigate = useNavigate()
    const formRef = React.useRef<HTMLFormElement>(null)
    const ownerRef = React.useRef<HTMLInputElement>(null)
    const [contributors, setContributors] = React.useState<Contributor[]>([])
    const [ownerRepos, setOwnerRepos] = React.useState<string[]>([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [ownerForPreload, setOwnerForPreload] = React.useState(owner)

    /** request repo contributors when repo & owner are set */
    React.useEffect(() => {
        if (repo && owner) {
            setLoading(true)
            octokit.repos
                .getContributorsStats({ owner, repo })
                .then((res) => {
                    setError(null)
                    if (Array.isArray(res.data)) {
                        const contribResponse = res.data
                            .map<Contributor | null>((item) => {
                                if (!item.author) return null
                                return {
                                    name: item.author.login,
                                    avatar: item.author.avatar_url,
                                    url: item.author.html_url,
                                    contributions: item.total,
                                }
                            })
                            .filter(notEmpty)
                            .sort((a, b) => b.contributions - a.contributions)
                        setContributors(contribResponse)
                    } else {
                        // looks like it's just a bad typing
                        console.warn('contributors is not an array', res.data)
                    }
                })
                .catch((e) => {
                    console.error(e)
                    setContributors([])
                    setError(`Oops, error: ${e}`)
                })
                .finally(() => setLoading(false))
        }
    }, [repo, owner])

    /** when user typed in owner – request it's repos list to make suggestions */
    React.useEffect(() => {
        if (ownerForPreload) {
            octokit.repos
                .listForUser({ username: ownerForPreload })
                .then((res) => {
                    setOwnerRepos(res.data.map((item) => item.name))
                })
        }
    }, [ownerForPreload])

    const handleSubmit: React.FormEventHandler = React.useCallback((e) => {
        e.preventDefault()
        if (formRef.current) {
            const form = formRef.current.elements as AppFormCollection
            navigate(`/repo/${form.owner.value}/${form.repo.value}`)
        }
    }, [])

    const handleOwnerBlur = React.useCallback(async () => {
        if (ownerRef.current) {
            setOwnerForPreload(ownerRef.current.value)
        }
    }, [])

    return (
        <>
            <NavBar active="repo" />
            <div className="container">
                <form
                    className="content level mt-5"
                    onSubmit={handleSubmit}
                    ref={formRef}
                >
                    <label className="label" htmlFor="owner">
                        Owner:
                    </label>
                    <input
                        className="input ml-3 mr-5"
                        type="text"
                        name="owner"
                        id="owner"
                        ref={ownerRef}
                        defaultValue={owner}
                        onBlur={handleOwnerBlur}
                    />
                    <label className="label" htmlFor="repo">
                        Repo:
                    </label>
                    <input
                        className="input ml-3 mr-5"
                        type="text"
                        name="repo"
                        id="repo"
                        defaultValue={repo}
                        autoComplete="off"
                        list="repos"
                    />
                    <datalist id="repos">
                        {ownerRepos.map((repoName) => {
                            return <option key={repoName}>{repoName} </option>
                        })}
                    </datalist>
                    <button className="button mt-3">Search</button>
                </form>
                <Loader show={loading} />
                {error && <h2> {error} </h2>}
                {contributors.map((contributor) => (
                    <div className="box" key={contributor.url}>
                        <article className="media">
                            <div className="media-left">
                                <figure className="image is-64x64">
                                    <img
                                        src={contributor.avatar}
                                        alt="contributor avatar"
                                    />
                                </figure>
                            </div>
                            <div className="media-content">
                                <div className="content">
                                    <h5 className="is-size-5">
                                        <a
                                            href={contributor.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {contributor.name}
                                        </a>
                                    </h5>
                                    <p>
                                        Total contributions:{' '}
                                        <strong>
                                            {contributor.contributions}
                                        </strong>
                                    </p>
                                </div>
                            </div>
                        </article>
                    </div>
                ))}
            </div>
        </>
    )
}

export function notEmpty<TValue>(
    value: TValue | null | undefined
): value is TValue {
    return value !== null && value !== undefined
}
