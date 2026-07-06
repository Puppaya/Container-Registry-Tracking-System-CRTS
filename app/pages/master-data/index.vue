<script setup lang="ts">
import { categoryToSlug, getDefaultMasterDataCategory } from '~/utils/master-data'

definePageMeta({
  roles: ['Administrator']
})

await navigateTo(`/master-data/${categoryToSlug(getDefaultMasterDataCategory())}`, { replace: true })
</script>
