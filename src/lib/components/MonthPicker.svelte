<script lang="ts">
    export let selectedMonth: string = '2023-03';
  
    // Optional: Emit an event when the month changes
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
  
    function handleMonthChange(event) {
      selectedMonth = event.target.value;
      dispatch('change', { selectedMonth });
    }
  </script>
  
  <div class="month-picker-container mt-4">
    <input
      id="month-picker"
      name="month"
      type="month"
      bind:value={selectedMonth}
      on:change={handleMonthChange}
      class="flex h-10 w-full rounded-md border border-input border-inputborder bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-epb disabled:cursor-not-allowed disabled:opacity-50"
    />
  </div>
  
  <style>
    .month-picker-container {
      display: flex;
      flex-direction: column;
      margin-bottom: 1rem;
    }
  
    .month-picker-label {
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      color: #333;
    }
  
    .month-picker-input {
      padding: 0.5rem 1rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 0.875rem;
      line-height: 1.5;
      color: #333;
      background-color: white;
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
    }
  
    .month-picker-input:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }
  </style>
  