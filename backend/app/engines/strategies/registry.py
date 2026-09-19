from app.engines.strategies.base import BaseStrategy
from app.engines.strategies.sma_crossover import SMACrossoverStrategy
from app.engines.strategies.ema_trend import EMATrendStrategy
from app.engines.strategies.momentum import MomentumStrategy
from app.engines.strategies.mean_reversion import MeanReversionStrategy


STRATEGY_REGISTRY: dict[str, type[BaseStrategy]] = {
    "sma_crossover": SMACrossoverStrategy,
    "ema_trend": EMATrendStrategy,
    "momentum": MomentumStrategy,
    "mean_reversion": MeanReversionStrategy,
}


def get_strategy(
    strategy_name: str,
    parameters: dict | None = None,
) -> BaseStrategy:
    """
    Create a strategy instance from the strategy registry.

    Parameters
    ----------
    strategy_name : str
        Registered strategy name.

    parameters : dict | None
        Strategy-specific parameters.

    Returns
    -------
    BaseStrategy
        Configured strategy instance.
    """

    strategy_class = STRATEGY_REGISTRY.get(strategy_name)

    if strategy_class is None:
        available = ", ".join(sorted(STRATEGY_REGISTRY.keys()))

        raise ValueError(
            f"Unknown strategy '{strategy_name}'. "
            f"Available strategies: {available}"
        )

    parameters = parameters or {}

    return strategy_class(**parameters)


def list_strategies() -> list[str]:
    """
    Return all registered strategy names.
    """

    return sorted(STRATEGY_REGISTRY.keys())