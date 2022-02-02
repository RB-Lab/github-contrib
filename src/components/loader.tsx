import './loader.css'

export const Loader: React.FC<{ show: boolean }> = ({ show }) => {
    return <div className={`loader-linear ${show ? 'show' : ''}`} />
}
