package ua.pp.svitlo.power.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import ua.pp.svitlo.power.data.model.OutageScheduleResponse
import ua.pp.svitlo.power.data.repository.PowerRepository

class OutagesViewModel : ViewModel() {
    private val repository = PowerRepository()
    
    private val _outagesState = MutableStateFlow<UiState<OutageScheduleResponse>>(UiState.Loading)
    val outagesState: StateFlow<UiState<OutageScheduleResponse>> = _outagesState.asStateFlow()
    
    private val _currentQueue = MutableStateFlow("6.2")
    val currentQueue: StateFlow<String> = _currentQueue.asStateFlow()
    
    init {
        loadOutages()
    }
    
    fun loadOutages(silent: Boolean = false) {
        viewModelScope.launch {
            // Only show loading state if we don't have data yet (initial load)
            if (!silent || _outagesState.value is UiState.Loading || _outagesState.value is UiState.Error) {
                _outagesState.value = UiState.Loading
            }
            repository.getOutagesSchedule(_currentQueue.value)
                .onSuccess { _outagesState.value = UiState.Success(it) }
                .onFailure { 
                    // Only show error if we don't have existing data
                    if (_outagesState.value !is UiState.Success) {
                        _outagesState.value = UiState.Error(it.message ?: "Unknown error")
                    }
                }
        }
    }
    
    fun setQueue(queue: String) {
        _currentQueue.value = queue
        loadOutages()
    }
}

