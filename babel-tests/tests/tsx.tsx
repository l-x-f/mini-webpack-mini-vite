import type { PropType } from 'vue'
import { defineComponent, reactive, nextTick, watch } from 'vue'
import { ElTabs, ElTabPane } from 'element-plus'
import 'element-plus/es/components/tabs/style/index'
import 'element-plus/es/components/tab-pane/style/index'
import { useBase } from '@/hooks'
import type { ITabs } from './type'
import './index.scss'

export default defineComponent({
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    tabs: {
      type: Array as PropType<ITabs>,
      default: () => []
    },
    autoMemoryActive: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit, slots }) {
    const state = reactive<{ activeName: string }>({ activeName: '' })
    const { route, router } = useBase()

    watch(
      () => props.modelValue,
      val => {
        val && (state.activeName = val)
      },
      {
        immediate: true
      }
    )

    // 记忆tabs
    if (props.autoMemoryActive) {
      const { activeName } = route.query
      if (activeName) {
        state.activeName = activeName as string
      }
    }
    const setDefaultTab = (value?: string) => {
      nextTick(() => {
        const name = value || props.tabs[0]?.name

        if (props.autoMemoryActive) {
          router.replace({
            path: route.path,
            query: { ...route.query, activeName: name }
          })
        }
        onTabClick({ props: { name } })
      })
    }
    watch(
      () => state.activeName,
      val => {
        val && setDefaultTab(val)
      },
      {
        immediate: true
      }
    )
    const onTabClick = (e: any) => {
      emit('update:modelValue', e.props.name)
    }
    return () => (
      <div class='tabs' id='tabs'>
        <ElTabs onTab-click={onTabClick} modelValue={state.activeName}>
          {props.tabs?.map(item => (
            <ElTabPane
              label={item.label as string}
              name={item.name}
              disabled={item.disabled}
            >
              {slots.default && slots.default(item)}
            </ElTabPane>
          ))}
        </ElTabs>
      </div>
    )
  }
})
