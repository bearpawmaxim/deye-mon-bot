package ua.pp.svitlo.power.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import ua.pp.svitlo.power.data.model.PowerLogResponse
import ua.pp.svitlo.power.data.repository.PowerRepository
import java.time.LocalDate

class BuildingDetailViewModel : ViewModel() {
    private val repository = PowerRepository()
    
    private val _powerLogsState = MutableStateFlow<UiState<PowerLogResponse>>(UiState.Loading)
    val powerLogsState: StateFlow<UiState<PowerLogResponse>> = _powerLogsState.asStateFlow()
    
    private val _selectedDate = MutableStateFlow(LocalDate.now())
    val selectedDate: StateFlow<LocalDate> = _selectedDate.asStateFlow()
    
    fun loadPowerLogs(buildingId: String, silent: Boolean = false, date: LocalDate = _selectedDate.value) {
        _selectedDate.value = date
        viewModelScope.launch {
            // Only show loading state if we don't have data yet (initial load)
            if (!silent || _powerLogsState.value is UiState.Loading || _powerLogsState.value is UiState.Error) {
                _powerLogsState.value = UiState.Loading
            }
            val (startDate, endDate) = repository.getDateRangeForDate(date)
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

