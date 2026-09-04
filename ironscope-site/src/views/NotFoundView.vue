<template>
  <section class="shell flex min-h-[55vh] flex-col justify-center py-24">
    <p class="label max-w-md">Error 404</p>
    <h1 class="display-1 mt-6 max-w-2xl text-ink">
      No record at this reference.
    </h1>
    <p class="mt-5 max-w-md text-[16px] leading-relaxed text-ink-2">
      The link may be out of date, or the page may have moved.
    </p>
    <div class="mt-9 flex flex-wrap gap-3">
      <RouterLink to="/" class="btn btn-signal">Back to the start</RouterLink>
    </div>
  </section>
</template>
