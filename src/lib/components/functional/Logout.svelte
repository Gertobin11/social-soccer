<script lang="ts">
  import { Modal } from '@skeletonlabs/skeleton-svelte';

  let openState = $state(false);

  function modalClose() {
    openState = false;
  }

  /**
   * Function thats submits the logout form 
   */
  function logout() {
    let form: HTMLFormElement | null = document.querySelector('#logout_form');

    if(form) {
        form.submit()
    }
  }
</script>

<Modal
  open={openState}
  onOpenChange={(e) => (openState = e.open)}
  triggerBase="btn preset-tonal"
  contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-screen-sm"
  backdropClasses="backdrop-blur-sm"
>
  {#snippet trigger()}Logout{/snippet}
  {#snippet content()}
    <header class="flex justify-between">
      <h2 class="h2">Confirm Logout</h2>
    </header>
    <article>
      <p class="opacity-60">
       CLick on the confirm button below to Logout.
      </p>
    </article>
    <footer class="flex justify-end gap-4">
      <button type="button" class="btn preset-tonal" onclick={modalClose}>Cancel</button>
      <button type="button" class="btn preset-filled" onclick={logout}>Confirm</button>
    </footer>
  {/snippet}
</Modal>