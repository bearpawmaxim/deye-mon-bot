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
    
    fun loadPowerLogs(buildingId: Int) {
        viewModelScope.launch {
            _powerLogsState.value = UiState.Loading
            val (startDate, endDate) = repository.getTodayDateRange()
            repository.getPowerLogs(buildingId, startDate, endDate)
                .onSuccess { _powerLogsState.value = UiState.Success(it) }
                .onFailure { _powerLogsState.value = UiState.Error(it.message ?: "Unknown error") }
        }
    }
}

