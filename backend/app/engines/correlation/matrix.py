import pandas as pd


def calculate_correlation_matrix(
    returns: pd.DataFrame,
    method: str = "pearson",
) -> pd.DataFrame:
    """
    Calculate the correlation matrix between multiple assets.

    Parameters
    ----------
    returns : pd.DataFrame
        DataFrame where each column represents an asset's
        return series.

    method : str
        Correlation method:
        - pearson
        - spearman
        - kendall

    Returns
    -------
    pd.DataFrame
        Correlation matrix.
    """

    if returns.empty:
        return pd.DataFrame(index=returns.columns, columns=returns.columns)

    supported_methods = {"pearson", "spearman", "kendall"}

    if method not in supported_methods:
        raise ValueError(
            f"Unsupported correlation method: {method}. "
            f"Choose from {sorted(supported_methods)}."
        )

    return returns.corr(method=method)