import request from '@/utils/request'

export function fetchTestingCaseList() {
  return request({
    url: '/api/testing/cases',
    method: 'get'
  })
}

export function createTestingCase(data) {
  return request({
    url: '/api/testing/case',
    method: 'post',
    data
  })
}

export function updateTestingCase(data) {
  return request({
    url: '/api/testing/case',
    method: 'put',
    data
  })
}

export function deleteTestingCase(id) {
  return request({
    url: '/api/testing/case/' + id,
    method: 'delete'
  })
}

export function getTestingCaseDetail(id) {
  return request({
    url: '/api/testing/case/' + id,
    method: 'get'
  })
}

export function createTestingCaseDetail(data) {
  return request({
    url: '/api/test/cases/detail',
    method: 'post',
    data
  })
}

export function updateTestingCaseDetail(data) {
  return request({
    url: '/api/test/cases/detail',
    method: 'put',
    data
  })
}

export function deleteTestingCaseDetail(id) {
  return request({
    url: '/api/test/cases/detail/' + id,
    method: 'delete'
  })
}

export function downloadTestingCaseDetailFile(id) {
  return request({
    url: '/test/cases/file/' + id + '/download',
    method: 'get'
  })
}

export function deleteTestingCaseDetailFile(id) {
  return request({
    url: '/api/test/cases/details/file/' + id,
    method: 'delete'
  })
}

