<template>
    <teleport to="body">
        <div v-if="isVisible" class="modal">
            <div class="w-25">
                <div class="modal-content rounded-6 shadow">
                    <div class="modal-header border-bottom-0">
                        <h3 class="modal-title">やること詳細</h3>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="閉じる" @click="$emit('closeModal')"></button>
                    </div>
                    <div class="modal-body py-0">
                        <li class="d-flex gap-4">
                            <div>
                                <h5 class="mb-1">タイトル</h5>
                                    <p class="mb-5">{{ todo.name }}</p>

                                <h5 class="mb-1">内容</h5>
                                    <p class="mb-5">{{ todo.description }}</p>

                                <h5 class="mb-1">作成日時</h5>
                                    <p class="mb-5">{{ todo.createdAt }}</p>
                            </div>
                        </li>
                    </div>
                    <div class="modal-footer flex-column border-top-0">
                        <button type="button" class="btn btn-lg btn-light w-50 mx-0" data-bs-dismiss="modal" @click="$emit('deleteTodo', todo.id)">削除</button>
                    </div>
                </div>
            </div>
        </div>
    </teleport>
</template>

<script>
export default {
    name: 'Todo',
    props: ["isVisible", "todo"],
    emits: ['closeModal', 'deleteTodo'],
    data() {
        return {
        }
    },
}
</script>

<style scoped>
.modal {
    position: absolute;
    top: 0; right: 0; bottom: 0; left: 0;
    background-color: rgba(0,0,0,.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}


</style>