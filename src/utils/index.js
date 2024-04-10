import moment from "moment"

export function setErrorMessage(status, error, message) {
  return {
    status,
    detail: error?.toString(),
    message,
    createdAt: moment(),
  }
}

export function sortExperiences(prevExperiences) {
  let newExperiences = prevExperiences.sort((a, b) => {
    if (b.current && !a.current) return 1
    if (a.current && !b.current) return -1

    const endDateB = new Date(`${b.endDateYear}-${b.endDateMonth}-01`)
    const endDateA = new Date(`${a.endDateYear}-${a.endDateMonth}-01`)

    if (b.endDateYear && a.endDateYear && endDateA !== endDateB) {
      return endDateB - endDateA
    }

    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  return newExperiences
}

export function sortFormation(prevFormations) {
  let newFormations = prevFormations.sort((a, b) => {
    if (b.current && !a.current) return 1
    if (a.current && !b.current) return -1

    const endDateB = new Date(`${b.endDateYear}-${b.endDateMonth}-01`)
    const endDateA = new Date(`${a.endDateYear}-${a.endDateMonth}-01`)

    if (b.endDateYear && a.endDateYear && endDateA !== endDateB) {
      return endDateB - endDateA
    }

    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  return newFormations
}

export function sortCertificates(prevCertificates) {
  let newCertificates = prevCertificates.sort((a, b) => {
    const issueDateB = new Date(`${b.issueYear}-${b.issueMonth}-01`)
    const issueDateA = new Date(`${a.issueYear}-${a.issueMonth}-01`)

    if (issueDateA !== issueDateB) {
      return issueDateB - issueDateA
    }

    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  return newCertificates
}
