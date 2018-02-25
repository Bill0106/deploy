var app = new Vue({
  el: '#app',
  data: {
    commits: [],
    page: 1,
    isFetching: false,
  },
  methods: {
    async fetchList() {
      const limit = 30
      const offset = (this.page - 1) * 30

      this.isFetching = true
      const res = await axios.get(`/commits?repo=admin&limit=${limit}&offset=${offset}`)
      this.commits = res.data.map(item => {
        return {
          ...item,
          commit_id: item.commit_id.substr(0, 8),
          committer: `${item.committer_name} <${item.committer_email}>`
        }
      })
      this.isFetching = false
    }
  },
  mounted() {
    this.fetchList()
  }
})
