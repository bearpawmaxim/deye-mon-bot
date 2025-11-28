package ua.pp.svitlo.power.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import ua.pp.svitlo.power.data.model.PowerLogResponse
import ua.pp.svitlo.power.data.repository.PowerRepository

class BuildingDetailViewModel : ViewModel() {
    private val repository = PowerRepository()
    
    private val _powerLogsState = MutableStateFlow<UiState<PowerLogResponse>>(UiState.Loading)
    val powerLogsState: StateFlow<UiState<PowerLogResponse>> = _powerLogsState.asStateFlow()
    
    fun loadPowerLogs(buildingId: Int, silent: Boolean = false) {
        viewModelScope.launch {
            // Only show loading state if we don't have data yet (initial load)
            if (!silent || _powerLogsState.value is UiState.Loading || _powerLogsState.value is UiState.Error) {
                _powerLogsState.value = UiState.Loading
            }
            val (startDate, endDate) = repository.getTodayDateRange()
            repository.getPowerLogs(buildingId, startDate, endDate)
                .onSuccess { _powerLogsState.value = UiState.Success(it) }
                .onFailure { 
                    // Only show error if we don't have existing data
                    if (_powerLogsState.value !is UiState.Success) {
                        _powerLogsState.value = UiState.Error(it.message ?: "Unknown error")
                    }
                }
        }
    }
}

