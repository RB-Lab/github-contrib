import React from 'react'
import { Link } from 'react-router-dom'
import logo from './logo.png'

interface Props {
    active?: 'search' | 'repo'
}
export const NavBar = (props: Props) => {
    const [showMenu, setShowMenu] = React.useState(false)

    return (
        <nav
            className="navbar is-dark"
            role="navigation"
            aria-label="main navigation"
        >
            <div className="navbar-brand">
                <span className="navbar-item">
                    <img src={logo} width={28} height={28} />
                </span>

                <a
                    role="button"
                    className={`navbar-burger ${showMenu ? 'is-active' : ''}`}
                    aria-label="menu"
                    aria-expanded="false"
                    data-target="navbarBasicExample"
                    onClick={() => setShowMenu((shown) => !shown)}
                >
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                </a>
            </div>

            <div
                id="navbarBasicExample"
                className={`navbar-menu ${showMenu ? 'is-active' : ''}`}
            >
                <div className="navbar-start">
                    <Link
                        to="/"
                        className={`navbar-item ${
                            props.active === 'search' ? 'is-active' : ''
                        }`}
                    >
                        Search Repos
                    </Link>
                    <Link
                        to="/repo"
                        className={`navbar-item ${
                            props.active === 'repo' ? 'is-active' : ''
                        }`}
                    >
                        View Contributors
                    </Link>
                </div>
            </div>
        </nav>
    )
}
