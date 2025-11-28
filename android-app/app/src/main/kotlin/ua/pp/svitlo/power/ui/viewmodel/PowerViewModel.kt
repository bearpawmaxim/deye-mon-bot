package ua.pp.svitlo.power.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import ua.pp.svitlo.power.data.model.Building
import ua.pp.svitlo.power.data.model.DashboardSettings
import ua.pp.svitlo.power.data.repository.PowerRepository

sealed class UiState<out T> {
    object Loading : UiState<Nothing>()
    data class Success<T>(val data: T) : UiState<T>()
    data class Error(val message: String) : UiState<Nothing>()
}

class PowerViewModel : ViewModel() {
    private val repository = PowerRepository()
    
    private val _buildingsState = MutableStateFlow<UiState<List<Building>>>(UiState.Loading)
    val buildingsState: StateFlow<UiState<List<Building>>> = _buildingsState.asStateFlow()
    
    private val _configState = MutableStateFlow<UiState<DashboardSettings>>(UiState.Loading)
    val configState: StateFlow<UiState<DashboardSettings>> = _configState.asStateFlow()
    
    init {
        loadBuildings()
        loadConfig()
    }
    
    fun loadBuildings() {
        viewModelScope.launch {
            _buildingsState.value = UiState.Loading
            repository.getBuildings()
                .onSuccess { _buildingsState.value = UiState.Success(it) }
                .onFailure { _buildingsState.value = UiState.Error(it.message ?: "Unknown error") }
        }
    }
    
    private fun loadConfig() {
        viewModelScope.launch {
            _configState.value = UiState.Loading
            repository.getDashboardConfig()
                .onSuccess { _configState.value = UiState.Success(it) }
                .onFailure { _configState.value = UiState.Error(it.message ?: "Unknown error") }
        }
    }
}

